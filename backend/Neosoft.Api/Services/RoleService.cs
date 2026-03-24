using Neosoft.Api.Common;
using Neosoft.Api.Data;
using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Models.Entities;
using Neosoft.Api.Repositories;

namespace Neosoft.Api.Services;

public sealed class RoleService(
    IRoleRepository roleRepository,
    IUnitOfWork unitOfWork) : IRoleService
{
    private readonly IRoleRepository _roleRepository = roleRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<IReadOnlyList<RoleListItemDto>> GetAllForDropdownAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _roleRepository.GetAllOrderedByNameAsync(cancellationToken);
        return roles.Select(r => new RoleListItemDto(r.Id, r.Name, r.CreatedAt, r.UpdatedAt)).ToList();
    }

    public async Task<PagedResponse<RoleListItemDto>> GetAllAsync(QueryParameters parameters, CancellationToken cancellationToken = default)
    {
        var query = parameters.Normalized();
        var (items, totalCount) = await _roleRepository.GetPagedAsync(query, cancellationToken);
        var dtos = items.Select(r => new RoleListItemDto(r.Id, r.Name, r.CreatedAt, r.UpdatedAt)).ToList();
        var totalPages = query.PageSize <= 0 ? 0 : (int)Math.Ceiling(totalCount / (double)query.PageSize);
        return new PagedResponse<RoleListItemDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            TotalPages = totalPages,
        };
    }

    public async Task<RoleDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var role = await _roleRepository.GetByIdReadOnlyAsync(id, cancellationToken);
        return role is null
            ? null
            : new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                CreatedAt = role.CreatedAt,
                UpdatedAt = role.UpdatedAt,
            };
    }

    public async Task<ServiceResult<RoleDto>> CreateAsync(RoleDto dto, CancellationToken cancellationToken = default)
    {
        var name = dto.Name.Trim();

        var role = new Role
        {
            Name = name
        };

        await _roleRepository.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ServiceResult<RoleDto>.Ok(new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            CreatedAt = role.CreatedAt,
            UpdatedAt = role.UpdatedAt,
        });
    }

    public async Task<ServiceResult> UpdateAsync(int id, RoleDto dto, CancellationToken cancellationToken = default)
    {
        var role = await _roleRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (role is null)
        {
            return ServiceResult.NotFound();
        }

        var name = dto.Name.Trim();

        role.Name = name;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var role = await _roleRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (role is null)
        {
            return ServiceResult.NotFound();
        }

        var hasUsers = await _roleRepository.HasUsersAsync(id, cancellationToken);
        if (hasUsers)
        {
            return ServiceResult.Validation("No se puede eliminar un rol con usuarios asociados.");
        }

        _roleRepository.Remove(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }
}
