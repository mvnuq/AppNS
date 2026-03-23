using FluentValidation;
using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;

namespace Neosoft.Api.Validation;

public sealed class VariableDtoValidator : AbstractValidator<VariableDto>
{
    public VariableDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MinimumLength(2).WithMessage("El nombre debe tener al menos 2 caracteres.")
            .MaximumLength(200).WithMessage("El nombre no puede superar los 200 caracteres.");

        RuleFor(x => x.Value)
            .NotEmpty().WithMessage("El valor es obligatorio.")
            .MaximumLength(2000).WithMessage("El valor no puede superar los 2000 caracteres.");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("El tipo es obligatorio.")
            .Must(VariableType.IsValid)
            .WithMessage("El tipo debe ser texto, numérico o booleano.");
    }
}
