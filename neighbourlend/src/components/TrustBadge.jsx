import { ShieldCheck, Shield, Award, Star } from 'lucide-react';

export default function TrustBadge({ tier = "New User", score = 0, showLabel = true }) {
    const tiers = {
        "New User": { color: "bg-[#888888]", icon: Shield },
        "Trusted": { color: "bg-[#4A90D9]", icon: Award },
        "Verified": { color: "bg-[#7B61FF]", icon: ShieldCheck },
        "Community Star": { color: "bg-[#B2F000] text-black", icon: Star }
    };

    const currentTier = tiers[tier] || tiers["New User"];
    const Icon = currentTier.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill ${currentTier.color} text-white font-medium text-13pt`}>
            <Icon size={14} className={tier === "Community Star" ? "fill-black" : "fill-white/20"} />
            {showLabel && <span>{tier}</span>}
            {score > 0 && <span className="opacity-80 ml-1">• {score}</span>}
        </div>
    );
}
