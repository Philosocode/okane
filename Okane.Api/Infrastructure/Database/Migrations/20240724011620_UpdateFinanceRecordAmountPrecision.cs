using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Okane.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFinanceRecordAmountPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "FinanceRecords",
                type: "numeric(9,2)",
                precision: 9,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "FinanceRecords",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(9,2)",
                oldPrecision: 9,
                oldScale: 2);
        }
    }
}
