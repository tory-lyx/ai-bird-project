
namespace CentralServer.Models;

public class BirdAnalysis
{
    public int Id { get; set; }

    public string ImageName { get; set; } = "";

    public string PredictedSpecies { get; set; } = "";

    public double Confidence { get; set; }

    public DateTime AnalysisDate { get; set; }

    public string Description { get; set; } = "";
}
