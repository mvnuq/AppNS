using Microsoft.AspNetCore.Mvc;
using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Services;

namespace Neosoft.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RolesController(IRoleService roleService) : ControllerBase
{
    private readonly IRoleService _roleService = roleService;

    [HttpGet("for-dropdown")]
    public async Task<ActionResult<IEnumerable<RoleListItemDto>>> GetForDropdown(CancellationToken cancellationToken)
    {
        var roles = await _roleService.GetAllForDropdownAsync(cancellationToken);
        return Ok(roles);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<RoleListItemDto>>> Get(
        [FromQuery] QueryParameters? parameters,
        CancellationToken cancellationToken = default)
    {
        var result = await _roleService.GetAllAsync(parameters ?? new QueryParameters(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoleDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var role = await _roleService.GetByIdAsync(id, cancellationToken);
        if (role is null)
        {
            return NotFound();
        }

        return Ok(role);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] RoleDto dto, CancellationToken cancellationToken)
    {
        var result = await _roleService.CreateAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            return result.ToFailureResult(this);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] RoleDto dto, CancellationToken cancellationToken)
    {
        var result = await _roleService.UpdateAsync(id, dto, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _roleService.DeleteAsync(id, cancellationToken);
        return result.ToActionResult(this);
    }
}
