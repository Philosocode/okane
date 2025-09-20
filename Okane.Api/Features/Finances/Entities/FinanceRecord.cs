using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NpgsqlTypes;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Infrastructure.Database.Constants;
using Okane.Api.Infrastructure.Database.Entities;

namespace Okane.Api.Features.Finances.Entities;

[Index(
    nameof(UserId),
    nameof(Amount),
    nameof(Id),
    Name = "IX_FinanceRecords_UserId_Amount_Id_Asc")]
[Index(
    nameof(UserId),
    nameof(Amount),
    nameof(Id),
    IsDescending = [false, true, false],
    Name = "IX_FinanceRecords_UserId_Amount_Id_Desc"
)]
[Index(
    nameof(UserId),
    nameof(HappenedAt),
    nameof(Id),
    Name = "IX_FinanceRecords_UserId_HappenedAt_Asc"
)]
[Index(
    nameof(UserId),
    nameof(HappenedAt),
    nameof(Id),
    IsDescending = [false, true, false],
    Name = "IX_FinanceRecords_UserId_HappenedAt_Desc"
)]
public class FinanceRecord : IOwnedEntity
{
    public int Id { get; set; }

    [Precision(9, 2)]
    public required decimal Amount { get; set; }

    [MaxLength(DbConstants.MaxStringLength)]
    public required string Description { get; set; }

    public NpgsqlTsVector SearchVector { get; set; } = null!;

    public required DateTime HappenedAt { get; set; }

    public required FinanceRecordType Type { get; set; }

    // Navigation.
    public string UserId { get; set; } = string.Empty;
    public ApiUser User { get; set; } = null!;

    public ICollection<Tag> Tags { get; set; } = null!;
}

public class FinanceRecordEntityConfiguration : IEntityTypeConfiguration<FinanceRecord>
{
    public void Configure(EntityTypeBuilder<FinanceRecord> builder)
    {
        builder
            .HasGeneratedTsVectorColumn(
                fr => fr.SearchVector,
                "english",
                fr => new { fr.Description }
            )
            .HasIndex(fr => fr.SearchVector)
            .HasMethod("GIN");

        builder.Property<DateTime>("CreatedAt")
            .HasDefaultValueSql("NOW()");

        builder
            .HasMany(fr => fr.Tags)
            .WithMany(t => t.FinanceRecords)
            .UsingEntity<FinanceRecordTag>();
    }
}
