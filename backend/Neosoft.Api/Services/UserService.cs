using Neosoft.Api.Common;
using Neosoft.Api.Data;
using Neosoft.Api.Mapping;
using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Models.Entities;
using Neosoft.Api.Querying;
using Neosoft.Api.Repositories;

namespace Neosoft.Api.Services;

public sealed class UserService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IUnitOfWork unitOfWork) : IUserService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IRoleRepository _roleRepository = roleRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<IReadOnlyList<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllWithRoleAsync(cancellationToken);
        return users.Select(u => u.ToDto()).ToList();
    }

    /// <summary>
    /// Listado paginado. Los filtros se aplican sobre <c>IQueryable</c> antes de paginar
    /// (<see cref="PagedQueryableExtensions.ApplyUserPagedFilters"/> vía repositorio).
    /// </summary>
    public async Task<PagedResponse<UserDto>> GetAllAsync(QueryParameters parameters, CancellationToken cancellationToken = default)
    {
        var query = parameters.Normalized();
        var (items, totalCount) = await _userRepository.GetPagedWithRoleAsync(query, cancellationToken);
        var dtos = items.Select(u => u.ToDto()).ToList();
        var totalPages = query.PageSize <= 0 ? 0 : (int)Math.Ceiling(totalCount / (double)query.PageSize);
        return new PagedResponse<UserDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            TotalPages = totalPages,
        };
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdWithRoleAsync(id, cancellationToken);
        return user?.ToDto();
    }

    public async Task<ServiceResult<UserDto>> CreateAsync(UserCreateDto dto, CancellationToken cancellationToken = default)
    {
        if (!await _roleRepository.ExistsAsync(dto.RoleId, cancellationToken))
        {
            return ServiceResult<UserDto>.Validation(new Dictionary<string, string[]>
            {
                ["roleId"] = ["El rol indicado no existe."],
            });
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            RoleId = dto.RoleId
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _userRepository.GetByIdWithRoleAsync(user.Id, cancellationToken);
        if (created is null)
        {
            return ServiceResult<UserDto>.Validation("No se pudo recuperar el usuario tras crearlo.");
        }

        return ServiceResult<UserDto>.Ok(created.ToDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, UserCreateDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return ServiceResult.NotFound();
        }

        if (!await _roleRepository.ExistsAsync(dto.RoleId, cancellationToken))
        {
            return ServiceResult.Validation(new Dictionary<string, string[]>
            {
                ["roleId"] = ["El rol indicado no existe."],
            });
        }

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.RoleId = dto.RoleId;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return ServiceResult.NotFound();
        }

        _userRepository.Remove(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }
}
