using Microsoft.AspNetCore.Mvc;


using KhetSaathi.Models.ViewModel;

namespace KhetSaathi.Controllers
{
    public class CustomerController : Controller
    {

        public IActionResult Dashboard()
        {
            return View();
        }
        public IActionResult LocalVoiceQA()
        {

            return View();

        }

        [HttpPost("GetWeather")]
        public IActionResult GetWeather([FromBody] dynamic request)
        {
            double latitude = request.latitude;
            double longitude = request.longitude;

            string location = $"Your current location is: Latitude: {latitude}, Longitude: {longitude}";
            return Ok(location); // returns only string
        }
        [HttpGet]
        public JsonResult LocalVoiceQA(VoiceQuestionVM model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Question))
            {
                return Json(new { answer = "Sorry, I didn't get your question. Please try again." });
            }

            string question = model.Question.Trim();

            // TODO: Replace below with your real answer fetching logic
            // For demo, simple canned responses for some keywords

           

            return Json(new { answer = question });
        }
        public IActionResult LeafDiseaseDetection()
        {

            return View();
        }
        public IActionResult TreatmentGuide()
        {
            return View();
        }
        public IActionResult FertilizerIrrigationAdvisor()
        {
            return View();
        }
        public IActionResult CropRecommendation()
        {
            return View();
        }
        public IActionResult MandiRatesAndPrediction()
        {
            return View();
        }
        public IActionResult WeatherAlerts()
        {
            return View();
        }
        public IActionResult OfflineLowDataUI()
        {
            return View();
        }
        public IActionResult FieldDiary()
        {
            return View();
        }
        



    }
}
