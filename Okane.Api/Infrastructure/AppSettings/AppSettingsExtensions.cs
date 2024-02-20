namespace Okane.Api.Infrastructure.AppSettings;

public static class AppSettingsExtensions
{
    public static void AddAppSettingsJsonFiles(this WebApplicationBuilder builder)
    {
        string configDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Infrastructure", "AppSettings");
        string hostEnvironment = builder.Environment.EnvironmentName;

        builder.Configuration.AddJsonFile(
            Path.Combine(configDirectory, "appsettings.json")
        );
        builder.Configuration.AddJsonFile(
            Path.Combine(configDirectory, $"appsettings.{hostEnvironment}.json")
        );
    }
}
