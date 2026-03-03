export default function hitungMundur(targetDate) {
  const sekarang = new Date().getTime();
  const target = new Date(targetDate).getTime();

  const selisih = target - sekarang;

  if (selisih <= 0) {
    return "-";
  }

  const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
  const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
//   const detik = Math.floor((selisih % (1000 * 60)) / 1000);

  return `${hari} hari ${jam} jam ${menit} menit`;
}