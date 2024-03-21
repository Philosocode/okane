using Okane.Api.Infrastructure.Extensions;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting API");
    
    var builder = WebApplication.CreateBuilder(args);
    builder.AddServices();
    
    var app = builder.Build();
    await app.Configure();
    
    app.Run();
}
catch (Exception exception)
{
    Log.Fatal(exception, "API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
