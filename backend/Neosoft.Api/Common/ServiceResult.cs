namespace Neosoft.Api.Common;

/// <summary>
/// Result type for application-layer operations (no HTTP concerns).
/// </summary>
public sealed class ServiceResult
{
    public bool IsSuccess { get; }
    public ServiceErrorKind ErrorKind { get; }
    public string? Error { get; }
    /// <summary>Errores por campo (formato tipo Django: campo → lista de mensajes).</summary>
    public IReadOnlyDictionary<string, string[]>? FieldErrors { get; }

    private ServiceResult(bool isSuccess, ServiceErrorKind errorKind, string? error,
        IReadOnlyDictionary<string, string[]>? fieldErrors)
    {
        IsSuccess = isSuccess;
        ErrorKind = errorKind;
        Error = error;
        FieldErrors = fieldErrors;
    }

    public static ServiceResult Ok() => new(true, ServiceErrorKind.None, null, null);

    public static ServiceResult Fail(ServiceErrorKind kind, string error) =>
        new(false, kind, error, null);

    public static ServiceResult NotFound(string? message = null) =>
        new(false, ServiceErrorKind.NotFound, message ?? "Resource not found.", null);

    public static ServiceResult Validation(string error) =>
        new(false, ServiceErrorKind.Validation, error, null);

    public static ServiceResult Validation(IReadOnlyDictionary<string, string[]> fieldErrors) =>
        new(false, ServiceErrorKind.Validation, null, fieldErrors);
}

/// <summary>
/// Result type with a payload for create/read operations.
/// </summary>
public sealed class ServiceResult<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public ServiceErrorKind ErrorKind { get; }
    public string? Error { get; }
    public IReadOnlyDictionary<string, string[]>? FieldErrors { get; }

    private ServiceResult(bool isSuccess, T? value, ServiceErrorKind errorKind, string? error,
        IReadOnlyDictionary<string, string[]>? fieldErrors)
    {
        IsSuccess = isSuccess;
        Value = value;
        ErrorKind = errorKind;
        Error = error;
        FieldErrors = fieldErrors;
    }

    public static ServiceResult<T> Ok(T value) =>
        new(true, value, ServiceErrorKind.None, null, null);

    public static ServiceResult<T> Fail(ServiceErrorKind kind, string error) =>
        new(false, default, kind, error, null);

    public static ServiceResult<T> NotFound(string? message = null) =>
        new(false, default, ServiceErrorKind.NotFound, message ?? "Resource not found.", null);

    public static ServiceResult<T> Validation(string error) =>
        new(false, default, ServiceErrorKind.Validation, error, null);

    public static ServiceResult<T> Validation(IReadOnlyDictionary<string, string[]> fieldErrors) =>
        new(false, default, ServiceErrorKind.Validation, null, fieldErrors);
}
