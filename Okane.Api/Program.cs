using Okane.Api.Infrastructure.Extensions;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
    builder.AddServices();

    WebApplication app = builder.Build();
    await app.ConfigureAsync();

    app.Run();
}
catch (Exception exception)
{
    if (exception is not HostAbortedException)
    {
        Log.Fatal(exception, "API terminated unexpectedly");
    }
}
finally
{
    Log.CloseAndFlush();
}
