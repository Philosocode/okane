using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Okane.Api.Tests.Testing.Utils;

public static class UrlUtils
{
    public static string? GetUriByRouteName(
        WebApplicationFactory<IApiMarker> apiFactory,
        string routeName,
        object? values = null)
    {
        using var scope = apiFactory.Services.CreateScope();
        var linkGenerator = scope.ServiceProvider.GetRequiredService<LinkGenerator>();

        var context = new DefaultHttpContext
        {
            Request =
            {
                Host = new HostString("localhost"),
                Scheme = HttpScheme.Http.ToString()
            }
        };

        return linkGenerator.GetUriByName(
            context,
            routeName,
            values
        );
    }
}
