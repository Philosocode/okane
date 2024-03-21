using Okane.Api.Infrastructure.Extensions;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);
    builder.AddServices();
    
    var app = builder.Build();
    await app.Configure();
    
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
