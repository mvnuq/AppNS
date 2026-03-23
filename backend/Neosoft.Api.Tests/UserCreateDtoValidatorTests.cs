using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Validation;

namespace Neosoft.Api.Tests;

public sealed class UserCreateDtoValidatorTests
{
    private readonly UserCreateDtoValidator _validator = new();

    [Fact]
    public void Valido_cuando_datos_correctos()
    {
        var dto = new UserCreateDto
        {
            FullName = "Juan Pérez",
            Email = "juan@test.com",
            RoleId = 1,
        };

        var result = _validator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ab")]
    public void Falla_cuando_nombre_corto_o_vacio(string fullName)
    {
        var dto = new UserCreateDto
        {
            FullName = fullName,
            Email = "a@b.com",
            RoleId = 1,
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData("no-es-email")]
    [InlineData("")]
    public void Falla_cuando_email_invalido(string email)
    {
        var dto = new UserCreateDto
        {
            FullName = "Nombre válido",
            Email = email,
            RoleId = 1,
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
    }

    [Fact]
    public void Falla_cuando_roleId_no_positivo()
    {
        var dto = new UserCreateDto
        {
            FullName = "Nombre válido",
            Email = "a@b.com",
            RoleId = 0,
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
    }
}
