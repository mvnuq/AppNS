namespace Neosoft.Api.Models;

/// <summary>
/// Valores permitidos para el tipo de variable (requisito funcional).
/// </summary>
public static class VariableType
{
    public const string Texto = "texto";
    public const string Numerico = "numérico";
    public const string Booleano = "booleano";

    public static bool IsValid(string? type) =>
        type is Texto or Numerico or Booleano;
}
