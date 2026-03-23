using Neosoft.Api.Common;
using Neosoft.Api.Data;
using Neosoft.Api.Mapping;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Models.Entities;
using Neosoft.Api.Repositories;

namespace Neosoft.Api.Services;

public sealed class VariableService(
    IVariableRepository variableRepository,
    IUnitOfWork unitOfWork) : IVariableService
{
    private readonly IVariableRepository _variableRepository = variableRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<IReadOnlyList<VariableDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var variables = await _variableRepository.GetAllAsync(cancellationToken);
        return variables.Select(v => v.ToDto()).ToList();
    }

    public async Task<VariableDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var variable = await _variableRepository.GetByIdReadOnlyAsync(id, cancellationToken);
        return variable?.ToDto();
    }

    public async Task<ServiceResult<VariableDto>> CreateAsync(VariableDto dto, CancellationToken cancellationToken = default)
    {
        var variable = new Variable
        {
            Name = dto.Name,
            Value = dto.Value,
            Type = dto.Type
        };

        await _variableRepository.AddAsync(variable, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ServiceResult<VariableDto>.Ok(variable.ToDto());
    }

    public async Task<ServiceResult> UpdateAsync(int id, VariableDto dto, CancellationToken cancellationToken = default)
    {
        var variable = await _variableRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (variable is null)
        {
            return ServiceResult.NotFound();
        }

        variable.Name = dto.Name;
        variable.Value = dto.Value;
        variable.Type = dto.Type;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var variable = await _variableRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (variable is null)
        {
            return ServiceResult.NotFound();
        }

        _variableRepository.Remove(variable);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }
}
