using Neosoft.Api.Common;
using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;

namespace Neosoft.Api.Services;

public interface IVariableService
{
    Task<IReadOnlyList<VariableDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<PagedResponse<VariableDto>> GetAllAsync(QueryParameters parameters, CancellationToken cancellationToken = default);

    Task<VariableDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<ServiceResult<VariableDto>> CreateAsync(VariableDto dto, CancellationToken cancellationToken = default);

    Task<ServiceResult> UpdateAsync(int id, VariableDto dto, CancellationToken cancellationToken = default);

    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
