using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Neosoft.Api.Common;

/// <summary>
/// Formato de errores por campo similar a los serializers de Django REST: cada clave es el nombre del campo y el valor es un array de mensajes.
/// </summary>
public static class ModelStateValidationResponse
{
    public static IActionResult FromModelState(ActionContext context)
    {
        var dict = FlattenModelStateErrors(context.ModelState);
        return new BadRequestObjectResult(dict);
    }

    /// <summary>
    /// Convierte ModelState a diccionario campo → mensajes (camelCase), sin claves vacías.
    /// </summary>
    public static Dictionary<string, string[]> FlattenModelStateErrors(ModelStateDictionary modelState)
    {
        var errors = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        foreach (var (key, entry) in modelState)
        {
            if (entry.Errors.Count == 0)
            {
                continue;
            }

            var fieldKey = ToCamelCaseFieldKey(key);
            if (!errors.TryGetValue(fieldKey, out var list))
            {
                list = [];
                errors[fieldKey] = list;
            }

            foreach (var err in entry.Errors)
            {
                var msg = string.IsNullOrWhiteSpace(err.ErrorMessage)
                    ? err.Exception?.Message ?? "Error de validación."
                    : err.ErrorMessage;
                list.Add(msg);
            }
        }

        return errors.ToDictionary(x => x.Key, x => x.Value.ToArray(), StringComparer.Ordinal);
    }

    /// <summary>
    /// Toma la última parte del path (p. ej. dto.FullName → FullName) y la pasa a camelCase.
    /// </summary>
    internal static string ToCamelCaseFieldKey(string key)
    {
        if (string.IsNullOrEmpty(key))
        {
            return key;
        }

        var lastDot = key.LastIndexOf('.');
        var name = lastDot >= 0 ? key[(lastDot + 1)..] : key;

        // Quitar prefijos tipo $ o [0]
        if (name.StartsWith("$", StringComparison.Ordinal))
        {
            name = name.TrimStart('$');
            var nextDot = name.IndexOf('.');
            if (nextDot >= 0)
            {
                name = name[(nextDot + 1)..];
            }
        }

        if (name.Length == 0)
        {
            return key;
        }

        return char.ToLowerInvariant(name[0]) + name[1..];
    }
}
