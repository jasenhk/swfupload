using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Swfupload.Controllers
{
    public class CropController : Controller
    {
        //
        // GET: /Crop/

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Crop(int x, int y, int w, int h)
        {
            return Json(new { x0 = x, y0 = y, width = w, height = h });
        }
    }
}
