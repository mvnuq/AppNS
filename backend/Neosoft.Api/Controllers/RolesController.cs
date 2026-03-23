using Microsoft.AspNetCore.Mvc;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Services;

namespace Neosoft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController(IRoleService roleService) : ControllerBase
{
    private readonly IRoleService _roleService = roleService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleListItemDto>>> Get(CancellationToken cancellationToken)
    {
        var roles = await _roleService.GetAllForDropdownAsync(cancellationToken);
        return Ok(roles);
    }
}
