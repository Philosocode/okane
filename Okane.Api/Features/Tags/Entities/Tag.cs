using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database.Constants;
using Okane.Api.Infrastructure.Database.Entities;

namespace Okane.Api.Features.Tags.Entities;

[Index(nameof(Name), IsUnique = true)]
public class Tag : IEntity
{
    public int Id { get; set; }

    public const int MaxTagLength = 20;

    [MaxLength(MaxTagLength)]
    public string Name { get; set; } = string.Empty;

    // Navigation.
    public ICollection<FinanceRecord> FinanceRecords { get; set; } = null!;
}

public class TagEntityConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder
            .Property(t => t.Name)
            .UseCollation(DbConstants.CaseInsensitiveCollation);

        builder
            .HasMany(t => t.FinanceRecords)
            .WithMany(fr => fr.Tags)
            .UsingEntity<FinanceRecordTag>();
    }
}
