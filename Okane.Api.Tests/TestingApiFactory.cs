using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests;

public class TestingApiFactory : WebApplicationFactory<IApiMarker>
{
    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(configurationBuilder =>
        {
            var currentDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!;
            var settingsFilePath = Path.Combine(currentDirectory, "appsettings.Test.json");
            configurationBuilder.AddJsonFile(settingsFilePath, false, false);
            
            configurationBuilder.AddUserSecrets<ITestProjectMarker>();
        });
        
        return base.CreateHost(builder);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll(typeof(IHostedService));
        });
    }
}
