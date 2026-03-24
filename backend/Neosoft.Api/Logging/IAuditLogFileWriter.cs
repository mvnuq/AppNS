namespace Neosoft.Api.Logging;

/// <summary>
/// Persiste líneas de auditoría en la carpeta <c>log/</c> del contenido de la aplicación.
/// </summary>
public interface IAuditLogFileWriter
{
    void AppendLine(string action, string entityName, int entityId, DateTime utcNow);
}
