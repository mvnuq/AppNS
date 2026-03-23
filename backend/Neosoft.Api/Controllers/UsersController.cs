using Microsoft.AspNetCore.Mvc;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Services;

namespace Neosoft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService) : ControllerBase
{
    private readonly IUserService _userService = userService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> Get(CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] UserCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await _userService.CreateAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            return result.ToFailureResult(this);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] UserCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await _userService.UpdateAsync(id, dto, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _userService.DeleteAsync(id, cancellationToken);
        return result.ToActionResult(this);
    }
}
