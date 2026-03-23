using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Validation;

namespace Neosoft.Api.Tests;

public sealed class VariableDtoValidatorTests
{
    private readonly VariableDtoValidator _validator = new();

    [Theory]
    [InlineData(VariableType.Texto)]
    [InlineData(VariableType.Numerico)]
    [InlineData(VariableType.Booleano)]
    public void Valido_cuando_tipo_permitido(string type)
    {
        var dto = new VariableDto
        {
            Id = 0,
            Name = "clave",
            Value = "1",
            Type = type,
        };

        var result = _validator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("otro")]
    [InlineData("TEXT")]
    [InlineData("")]
    public void Falla_cuando_tipo_no_permitido(string type)
    {
        var dto = new VariableDto
        {
            Id = 0,
            Name = "clave",
            Value = "v",
            Type = type,
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
    }
}
