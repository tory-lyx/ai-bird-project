
using CentralServer.Models;
using Microsoft.EntityFrameworkCore;

namespace CentralServer.Data;

public class BirdDbContext : DbContext
{
    public BirdDbContext(DbContextOptions<BirdDbContext> options)
        : base(options)
    {
    }

    public DbSet<BirdAnalysis> BirdAnalyses => Set<BirdAnalysis>();
}
