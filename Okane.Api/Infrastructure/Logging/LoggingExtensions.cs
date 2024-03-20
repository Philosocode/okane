using Serilog;

namespace Okane.Api.Infrastructure.Logging;

public static class LoggingExtensions
{
    public static void ConfigureLogging(this WebApplicationBuilder builder)
    {
        builder.Logging.ClearProviders();
        builder.Host.UseSerilog(((context, config) =>
        {
            config.ReadFrom.Configuration(context.Configuration);
        }));
    }
}
