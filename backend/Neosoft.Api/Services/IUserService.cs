using Neosoft.Api.Common;
using Neosoft.Api.Models.DTOs;

namespace Neosoft.Api.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<ServiceResult<UserDto>> CreateAsync(UserCreateDto dto, CancellationToken cancellationToken = default);

    Task<ServiceResult> UpdateAsync(int id, UserCreateDto dto, CancellationToken cancellationToken = default);

    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
