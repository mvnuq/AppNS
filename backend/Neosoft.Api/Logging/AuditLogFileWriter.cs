namespace Neosoft.Api.Logging;

/// <summary>
/// Escribe en <c>{ContentRoot}/log/audit.log</c> (TSV: instante hora Chile, acción, entidad, id).
/// </summary>
public sealed class AuditLogFileWriter : IAuditLogFileWriter
{
    private readonly string _filePath;
    private readonly object _writeLock = new();

    public AuditLogFileWriter(IHostEnvironment hostEnvironment)
    {
        var logDir = Path.Combine(hostEnvironment.ContentRootPath, "log");
        Directory.CreateDirectory(logDir);
        _filePath = Path.Combine(logDir, "audit.log");
    }

    public void AppendLine(string action, string entityName, int entityId, DateTime utcNow)
    {
        var chile = ChileTime.FormatForLog(utcNow);
        var line = $"{chile}\t{action}\t{entityName}\t{entityId}{Environment.NewLine}";
        lock (_writeLock)
        {
            File.AppendAllText(_filePath, line);
        }
    }
}
