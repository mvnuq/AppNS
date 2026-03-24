using System.Globalization;

namespace Neosoft.Api.Logging;

/// <summary>
/// Convierte instantes UTC a hora de Chile (America/Santiago, con horario de verano según reglas del sistema).
/// </summary>
public static class ChileTime
{
    private static readonly TimeZoneInfo Zone = Resolve();

    private static TimeZoneInfo Resolve()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("America/Santiago");
        }
        catch (Exception ex) when (ex is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            // Windows antiguo sin id IANA
            return TimeZoneInfo.FindSystemTimeZoneById("Pacific SA Standard Time");
        }
    }

    /// <summary>UTC → fecha/hora local Chile.</summary>
    public static DateTime FromUtc(DateTime utc)
    {
        var utcNormalized = utc.Kind == DateTimeKind.Utc
            ? utc
            : DateTime.SpecifyKind(utc, DateTimeKind.Utc);
        return TimeZoneInfo.ConvertTimeFromUtc(utcNormalized, Zone);
    }

    /// <summary>Texto para logs (fecha, hora y offset, ej. -03:00).</summary>
    public static string FormatForLog(DateTime utc)
    {
        return FromUtc(utc).ToString("yyyy-MM-dd HH:mm:ss zzz", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Instantáneo almacenado en BD como UTC (o <see cref="DateTimeKind.Unspecified"/> como UTC) → ISO 8601 con offset Chile.
    /// </summary>
    public static string ToIso8601Json(DateTime value)
    {
        var utc = value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };
        var local = TimeZoneInfo.ConvertTimeFromUtc(utc, Zone);
        var offset = Zone.GetUtcOffset(local);
        return new DateTimeOffset(local, offset).ToString("o", CultureInfo.InvariantCulture);
    }
}
