namespace Okane.Api.Shared.Wrappers.GuidGenerator;

public interface IGuidGenerator
{
    Guid NewGuid();
}

public class GuidGenerator : IGuidGenerator
{
    public Guid NewGuid()
    {
        return Guid.NewGuid();
    }
}
