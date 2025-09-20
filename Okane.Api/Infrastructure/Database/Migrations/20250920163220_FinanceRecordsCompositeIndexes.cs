using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Okane.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class FinanceRecordsCompositeIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FinanceRecords_UserId",
                table: "FinanceRecords");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceRecords_UserId_Amount_Id_Asc",
                table: "FinanceRecords",
                columns: new[] { "UserId", "Amount", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceRecords_UserId_Amount_Id_Desc",
                table: "FinanceRecords",
                columns: new[] { "UserId", "Amount", "Id" },
                descending: new[] { false, true, false });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceRecords_UserId_HappenedAt_Asc",
                table: "FinanceRecords",
                columns: new[] { "UserId", "HappenedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceRecords_UserId_HappenedAt_Desc",
                table: "FinanceRecords",
                columns: new[] { "UserId", "HappenedAt", "Id" },
                descending: new[] { false, true, false });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FinanceRecords_UserId_Amount_Id_Asc",
                table: "FinanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_FinanceRecords_UserId_Amount_Id_Desc",
                table: "FinanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_FinanceRecords_UserId_HappenedAt_Asc",
                table: "FinanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_FinanceRecords_UserId_HappenedAt_Desc",
                table: "FinanceRecords");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceRecords_UserId",
                table: "FinanceRecords",
                column: "UserId");
        }
    }
}
