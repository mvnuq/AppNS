using FluentValidation;
using Neosoft.Api.Models.DTOs;

namespace Neosoft.Api.Validation;

public sealed class RoleDtoValidator : AbstractValidator<RoleDto>
{
    public RoleDtoValidator()
    {
        RuleFor(x => x.Name)
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("El nombre del rol es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre del rol no puede superar los 100 caracteres.");
    }
}
