using Microsoft.AspNetCore.Mvc;
using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Services;

namespace Neosoft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VariablesController(IVariableService variableService) : ControllerBase
{
    private readonly IVariableService _variableService = variableService;

    [HttpGet]
    public async Task<ActionResult<PagedResponse<VariableDto>>> Get(
        [FromQuery] QueryParameters? parameters,
        CancellationToken cancellationToken = default)
    {
        var variables = await _variableService.GetAllAsync(parameters ?? new QueryParameters(), cancellationToken);
        return Ok(variables);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VariableDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var variable = await _variableService.GetByIdAsync(id, cancellationToken);
        if (variable is null)
        {
            return NotFound();
        }

        return Ok(variable);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] VariableDto dto, CancellationToken cancellationToken)
    {
        var result = await _variableService.CreateAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            return result.ToFailureResult(this);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] VariableDto dto, CancellationToken cancellationToken)
    {
        var result = await _variableService.UpdateAsync(id, dto, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _variableService.DeleteAsync(id, cancellationToken);
        return result.ToActionResult(this);
    }
}
