using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Swfupload.Models;

namespace Swfupload.Controllers
{
    public class UploadController : Controller
    {
        //
        // GET: /Upload/

        public ActionResult Index()
        {
            Session["foo"] = "bar";
            var sessionId = Session.SessionID;
            return View();
        }

        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase fileUpload, string sessionId, string id)
        {
            FileUploadResult result = new FileUploadResult();
            result.FileName = "Foo";
            var _sessionId = Session.SessionID;
            return Content(result.ToJSON(), "application/json");
        }

        // Safari for Windows will choke here
        // ver. 5.1.2 (7534.52.7) as of Nov 30, 2011
        // Multiple files will upload with size 0 and an exception thrown
        // for the file read.
        [HttpPost]
        public ActionResult UploadFiles(HttpPostedFileBase[] fileUpload)
        {
            return Json(new { foo = "foo", bar = "bar" });
        }
    }
}
