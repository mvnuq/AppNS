using System.Globalization;
using Newtonsoft.Json;
using Neosoft.Api.Logging;

namespace Neosoft.Api.Common;

/// <summary>
/// Serializa y deserializa <see cref="DateTime"/> en JSON como ISO 8601 en zona horaria Chile.
/// Los valores en memoria/BD siguen siendo UTC; la representación JSON es local Chile.
/// </summary>
public sealed class ChileDateTimeNewtonsoftConverter : JsonConverter
{
    public override bool CanConvert(Type objectType)
    {
        return objectType == typeof(DateTime) || objectType == typeof(DateTime?);
    }

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        switch (value)
        {
            case null:
                writer.WriteNull();
                return;
            case DateTime dt:
                writer.WriteValue(ChileTime.ToIso8601Json(dt));
                return;
            default:
                writer.WriteNull();
                return;
        }
    }

    public override object? ReadJson(
        JsonReader reader,
        Type objectType,
        object? existingValue,
        JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null)
        {
            return objectType == typeof(DateTime?) ? null : default(DateTime);
        }

        if (reader.TokenType == JsonToken.Date && reader.Value is DateTime d)
        {
            return NormalizeToUtc(d);
        }

        var s = reader.Value?.ToString();
        if (string.IsNullOrWhiteSpace(s))
        {
            return objectType == typeof(DateTime?) ? null : default(DateTime);
        }

        var dto = DateTimeOffset.Parse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
        var utc = dto.UtcDateTime;
        return objectType == typeof(DateTime?) ? (DateTime?)utc : utc;
    }

    private static DateTime NormalizeToUtc(DateTime d)
    {
        return d.Kind switch
        {
            DateTimeKind.Utc => d,
            DateTimeKind.Local => d.ToUniversalTime(),
            _ => DateTime.SpecifyKind(d, DateTimeKind.Utc),
        };
    }
}
