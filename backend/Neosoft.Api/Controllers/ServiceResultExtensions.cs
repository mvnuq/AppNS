using Microsoft.AspNetCore.Mvc;
using Neosoft.Api.Common;

namespace Neosoft.Api.Controllers;

/// <summary>
/// Maps application-layer results to HTTP responses (keeps controllers thin).
/// </summary>
public static class ServiceResultExtensions
{
    public static IActionResult ToActionResult(this ServiceResult result, ControllerBase controller)
    {
        if (result.IsSuccess)
        {
            return controller.NoContent();
        }

        return ToFailureResult(result, controller);
    }

    public static IActionResult ToFailureResult(this ServiceResult result, ControllerBase controller)
    {
        return result.ErrorKind switch
        {
            ServiceErrorKind.NotFound => controller.NotFound(),
            _ => controller.BadRequest(result.Error)
        };
    }

    public static IActionResult ToFailureResult<T>(this ServiceResult<T> result, ControllerBase controller)
    {
        return result.ErrorKind switch
        {
            ServiceErrorKind.NotFound => controller.NotFound(),
            _ => controller.BadRequest(result.Error)
        };
    }
}
