import useCountUp from "../hooks/useCountUp";

export default function AnimatedNumber({ prefix = "", target, suffix = "", duration = 1500 }) {
  const { count, ref } = useCountUp(target, duration);
  return (
    <span ref={ref} className="big-num">
      {prefix}{count.toLocaleString("es-ES")}{suffix}
    </span>
  );
}