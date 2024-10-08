using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace Okane.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddFinanceRecordSearchVector : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "FinanceRecords",
                type: "tsvector",
                nullable: false)
                .Annotation("Npgsql:TsVectorConfig", "english")
                .Annotation("Npgsql:TsVectorProperties", new[] { "Description" });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceRecords_SearchVector",
                table: "FinanceRecords",
                column: "SearchVector")
                .Annotation("Npgsql:IndexMethod", "GIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FinanceRecords_SearchVector",
                table: "FinanceRecords");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "FinanceRecords");
        }
    }
}
