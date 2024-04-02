namespace Okane.Api.Shared.Wrappers;

public interface IGuidWrapper
{
    Guid NewGuid();
}

public class GuidWrapper : IGuidWrapper
{
    public Guid NewGuid()
    {
        return Guid.NewGuid();
    }
}
