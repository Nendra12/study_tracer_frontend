import { useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../../api/axios";

export default function AlertLowonganBaru({ statusAlumni }) {

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem("job_alert_dismissed");
    if (dismissed) return;

    // Only for alumni belum bekerja
    const isBekerja = statusAlumni === "Bekerja" || statusAlumni === "Kuliah" || statusAlumni === "Wirausaha";
    if (isBekerja) return;

    const fetchAndShow = async () => {
      try {
        const res = await api.get("/lowongan/published", { params: { per_page: 5 } });
        const responseData = res.data?.data;
        const lowongan = responseData?.data || (Array.isArray(responseData) ? responseData : []);
        const count = lowongan.length;

        if (count > 0) {
          const result = await Swal.fire({
            icon: "info",
            title: "🎯 Ada Lowongan Untukmu!",
            html: `
              <p style="font-size:14px;color:#64748b;margin-bottom:8px;">
                Kami menemukan <strong style="color:#3c5759;">${count} lowongan pekerjaan</strong> yang tersedia untukmu.
              </p>
              <p style="font-size:13px;color:#94a3b8;">
                Jangan lewatkan kesempatan ini, segera lihat dan lamar sekarang!
              </p>
            `,
            confirmButtonText: "Lihat Lowongan",
            confirmButtonColor: "#3c5759",
            showCancelButton: true,
            cancelButtonText: "Nanti Saja",
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
              popup: "rounded-2xl",
              title: "text-lg",
            },
          });

          sessionStorage.setItem("job_alert_dismissed", "true");

          if (result.isConfirmed) {
            window.location.href = "/alumni/lowongan";
          }
        }
      } catch {
        // Silently fail
      }
    };

    // Delay slightly so beranda loads first
    const timer = setTimeout(fetchAndShow, 1000);
    return () => clearTimeout(timer);
  }, [statusAlumni]);

  return null; // No inline render, SweetAlert handles the popup
}
