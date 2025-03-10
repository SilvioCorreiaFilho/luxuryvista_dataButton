// Backup of hero section data and configuration from March 2025

export const heroBackup = {
  image: {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2940&auto=format&fit=crop",
    alt: "Interior Luxuoso"
  },
  animation: {
    initial: { scale: 1.1 },
    animate: { scale: 1 },
    transition: { duration: 10, repeat: Infinity, repeatType: "reverse" }
  },
  effects: {
    gradient: "bg-gradient-to-b from-black/30 via-transparent to-black/40",
    colorGrading: {
      color: "bg-[#1a1a1a]/20",
      blendMode: "color"
    },
    softLight: {
      color: "bg-[#2d4a77]/10",
      blendMode: "soft-light"
    },
    multiply: {
      gradient: "bg-gradient-to-tr from-[#1a1a1a]/30 to-transparent",
      blendMode: "multiply"
    },
    vignette: "bg-radial-gradient"
  },
  content: {
    title: "Experiência em Imóveis de Alto Padrão",
    subtitle: "Descubra propriedades exclusivas em localizações privilegiadas",
    searchPlaceholder: "Descreva o imóvel dos seus sonhos...",
    buttons: {
      schedule: "Agende sua Visita",
      experience: "Experiência Imersiva"
    }
  }
}