import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, MapPin, Building2, Clock, ArrowRight, Bell, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { alumniApi } from "../../api/alumni";

export default function JobRecommendationPopup({ profile, onClose }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem("job_popup_dismissed");
    if (dismissed) return;

    // Check if alumni is "Belum Bekerja"
    const status = profile?.current_status?.status || profile?.status;
    const statusId = profile?.current_status?.id_status || profile?.id_status;
    const isBelumBekerja =
      statusId === 4 ||
      status === "Belum Bekerja" ||
      status === "Mencari Pekerjaan" ||
      !status;

    if (!isBelumBekerja) return;

    // Fetch unread job recommendation notifications
    const fetchJobNotifications = async () => {
      try {
        setLoading(true);
        const res = await alumniApi.getNotifications({ per_page: 10, type: "job_recommendation" });
        const notifications = res.data?.data?.data || res.data?.data || [];

        // Filter unread job notifications
        const jobNotifs = notifications.filter(
          (n) => !n.is_read && (n.type === "job_recommendation" || n.data?.type === "job_recommendation" || n.data?.lowongan_id)
        );

        if (jobNotifs.length > 0) {
          // Extract job data from notifications
          const jobsList = jobNotifs.slice(0, 5).map((n) => ({
            id: n.data?.lowongan_id || n.id,
            judul: n.data?.judul || n.data?.title || n.message || "Lowongan Baru",
            perusahaan: n.data?.perusahaan || n.data?.company || "",
            lokasi: n.data?.lokasi || n.data?.location || "",
            tipe: n.data?.tipe_pekerjaan || n.data?.type || "",
            notification_id: n.id,
          }));
          setJobs(jobsList);
          setVisible(true);
        }
      } catch (err) {
        // If can't get notifications, try fetching lowongan directly
        try {
          const res = await alumniApi.getLowongan({ per_page: 5 });
          const lowongan = res.data?.data?.data || res.data?.data || [];
          if (lowongan.length > 0) {
            setJobs(
              lowongan.slice(0, 5).map((l) => ({
                id: l.id || l.id_lowongan,
                judul: l.judul,
                perusahaan: l.perusahaan?.nama || l.nama_perusahaan || "",
                lokasi: l.lokasi || l.perusahaan?.kota?.nama || "",
                tipe: l.tipe_pekerjaan || "",
              }))
            );
            setVisible(true);
          }
        } catch {
          // Silently fail
        }
      } finally {
        setLoading(false);
      }
    };

    // Delay popup slightly for better UX
    const timer = setTimeout(fetchJobNotifications, 1500);
    return () => clearTimeout(timer);
  }, [profile]);

  const handleDismiss = () => {
    sessionStorage.setItem("job_popup_dismissed", "true");
    setVisible(false);
    if (onClose) onClose();
  };

  const handleViewJob = async (job) => {
    // Mark notification as read if we have the ID
    if (job.notification_id) {
      try {
        await alumniApi.markNotificationAsRead(job.notification_id);
      } catch {
        // Ignore
      }
    }
    handleDismiss();
    navigate(`/alumni/lowongan/${job.id}`);
  };

  const handleViewAll = () => {
    handleDismiss();
    navigate("/alumni/lowongan");
  };

  if (!visible || jobs.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header with gradient */}
            <div className="relative bg-primary p-6 text-white overflow-hidden">
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />

              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <Sparkles size={22} className="text-amber-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Rekomendasi Pekerjaan</h2>
                  <p className="text-white/70 text-xs font-medium">Lowongan yang cocok dengan profil Anda</p>
                </div>
              </div>

              <div className="relative z-10 mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10">
                <Bell size={14} className="text-amber-300" />
                <p className="text-[11px] text-white/80 font-medium">
                  Kami menemukan <strong className="text-white">{jobs.length} lowongan</strong> yang sesuai untuk Anda!
                </p>
              </div>
            </div>

            {/* Job List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleViewJob(job)}
                  className="group p-4 rounded-xl border border-fourth hover:border-primary/20 hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-fourth rounded-xl text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-primary truncate group-hover:text-primary/80 transition-colors">
                        {job.judul}
                      </h4>
                      {job.perusahaan && (
                        <p className="text-[11px] text-third font-medium flex items-center gap-1 mt-0.5">
                          <Building2 size={11} /> {job.perusahaan}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        {job.lokasi && (
                          <span className="text-[10px] text-third font-medium flex items-center gap-1">
                            <MapPin size={10} /> {job.lokasi}
                          </span>
                        )}
                        {job.tipe && (
                          <span className="text-[10px] text-third font-medium flex items-center gap-1">
                            <Clock size={10} /> {job.tipe}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-third group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-fourth bg-fourth/30 flex items-center justify-between gap-3">
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-sm font-semibold text-third hover:text-primary transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
              <button
                onClick={handleViewAll}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Lihat Semua Lowongan
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
