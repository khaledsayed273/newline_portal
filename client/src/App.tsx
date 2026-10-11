import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// الصفحة الرئيسية (شبكة الخدمات)
import Home from "./pages/Home";

//صفحات المتدرب (redirect للصفحة الرئيسية)
import TraineeDashboard from "./pages/trainee/TraineeDashboard";
import TraineeCourses from "./pages/trainee/TraineeCourses";
import TraineeCourseDetail from "./pages/trainee/TraineeCourseDetail";
import TraineeTracks from "./pages/trainee/TraineeTracks";
import TraineeBriefFiles from "./pages/trainee/TraineeBriefFiles";
import TraineeQuizzes from "./pages/trainee/TraineeQuizzes";
import TraineeCertificates from "./pages/trainee/TraineeCertificates";
import TraineeFAQs from "./pages/trainee/TraineeFAQs";
import TraineeIncidents from "./pages/trainee/TraineeIncidents";
import TraineeTrainingRequest from "./pages/trainee/TraineeTrainingRequest";
import TraineeSuggestions from "./pages/trainee/TraineeSuggestions";
import TraineeJobDescriptions from "./pages/trainee/TraineeJobDescriptions";
import PathCertificate from "./pages/trainee/PathCertificate";
import TrainingMap from "./pages/TrainingMap";
import TrainingLibrary from "./pages/TrainingLibrary";
import TraineeGeneralCulture from "./pages/trainee/TraineeGeneralCulture";
import TraineeOrientationPath from "./pages/trainee/TraineeOrientationPath";
import TraineeConsultations from "./pages/trainee/TraineeConsultations";
import TraineeStats from "./pages/trainee/TraineeStats";

// صفحات المدير
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminTracks from "./pages/admin/AdminTracks";
import AdminBriefFiles from "./pages/admin/AdminBriefFiles";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTrainingRequests from "./pages/admin/AdminTrainingRequests";
import AdminIncidents from "./pages/admin/AdminIncidents";
import AdminSuggestions from "./pages/admin/AdminSuggestions";

function Router() {
  return (
    <Switch>
      {/* الصفحة الرئيسية: تصميم الدورات التدريبية */}
      <Route path="/" component={TraineeCourses} />

      {/*إعادة توجيه مسارات trainee/ القديمة*/}
      <Route path="/trainee/courses">
        {() => {
          window.location.replace("/courses");
          return null;
        }}
      </Route>
      <Route path="/trainee/courses/:id">
        {(params: any) => {
          window.location.replace(`/courses/${params.id}`);
          return null;
        }}
      </Route>
      <Route path="/trainee/dashboard">
        {() => {
          window.location.replace("/dashboard");
          return null;
        }}
      </Route>

      {/* صفحات المتدرب */}
      <Route path="/dashboard" component={TraineeDashboard} />
      <Route path="/home" component={Home} />
      <Route path="/quick-courses" component={TraineeBriefFiles} />
      <Route path="/general-culture" component={TraineeGeneralCulture} />
      <Route path="/consultations" component={TraineeConsultations} />
      <Route path="/stats" component={TraineeStats} />
      <Route path="/courses" component={TraineeCourses} />
      <Route path="/courses/:id" component={TraineeCourseDetail} />
      <Route path="/tracks" component={TraineeTracks} />
      <Route path="/brief-files" component={TraineeBriefFiles} />
      <Route path="/quizzes" component={TraineeQuizzes} />
      <Route path="/certificates" component={TraineeCertificates} />
      <Route path="/faqs" component={TraineeFAQs} />
      <Route path="/incidents" component={TraineeIncidents} />
      <Route path="/training-request" component={TraineeTrainingRequest} />
      <Route path="/suggestions" component={TraineeSuggestions} />
      <Route path="/job-descriptions" component={TraineeJobDescriptions} />
      <Route path="/certificate/path/:pathId" component={PathCertificate} />
      <Route path="/training-map" component={TraineeOrientationPath} />
      <Route path="/map" component={TrainingMap} />
      <Route path="/library" component={TrainingLibrary} />

      {/*صفحات المدير*/}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/tracks" component={AdminTracks} />
      <Route path="/admin/brief-files" component={AdminBriefFiles} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route
        path="/admin/training-requests"
        component={AdminTrainingRequests}
      />
      <Route path="/admin/incidents" component={AdminIncidents} />
      <Route path="/admin/suggestions" component={AdminSuggestions} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
