import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Gift, ShoppingCart, Zap, Star, Trophy, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const Rewards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentXP] = useState(1250);
  const [redeemedVouchers, setRedeemedVouchers] = useState<any[]>([]);

  const schwarzStores = [
    {
      name: "Lidl",
      logo: "🛒",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      vouchers: [
        { value: 5, cost: 500, description: "€5 off your next shopping" },
        { value: 10, cost: 1000, description: "€10 off purchases over €50" },
        { value: 20, cost: 2000, description: "€20 off purchases over €100" },
      ]
    },
    {
      name: "Kaufland",
      logo: "🏬",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      vouchers: [
        { value: 5, cost: 500, description: "€5 off your next shopping" },
        { value: 10, cost: 1000, description: "€10 off purchases over €50" },
        { value: 25, cost: 2500, description: "€25 off purchases over €150" },
      ]
    },
    {
      name: "PreZero (Recycling)",
      logo: "♻️",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      vouchers: [
        { value: 15, cost: 750, description: "€15 credit for recycling services" },
        { value: 30, cost: 1500, description: "€30 credit for waste management" },
      ]
    }
  ];

  const redeemVoucher = (store: string, voucher: any) => {
    if (currentXP < voucher.cost) {
      toast({
        title: "Insufficient XP",
        description: `You need ${voucher.cost} XP to redeem this voucher. You have ${currentXP} XP.`,
        variant: "destructive",
      });
      return;
    }

    const voucherCode = `${store.toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months validity

    const newVoucher = {
      id: Date.now(),
      store,
      value: voucher.value,
      code: voucherCode,
      description: voucher.description,
      redeemed_at: new Date(),
      expires_at: expiryDate,
      used: false
    };

    setRedeemedVouchers(prev => [newVoucher, ...prev]);

    toast({
      title: "Voucher Redeemed! 🎉",
      description: `Your €${voucher.value} ${store} voucher is ready to use!`,
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app')}
              className="hover-glow mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center neon-glow">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">SCHWARZ SMART KITCHEN</h1>
              <p className="text-sm text-muted-foreground">XP Rewards System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass-card px-3 py-2 text-sm font-medium text-foreground">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/50">
              <Zap className="w-4 h-4 mr-1" />
              {currentXP} XP
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Your Vouchers Section */}
        {redeemedVouchers.length > 0 && (
          <div className="mb-8">
            <Card className="glass-card border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" />
                  Your Active Vouchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {redeemedVouchers.map((voucher) => (
                    <div key={voucher.id} className="glass-card-hover p-4 border-l-4 border-accent">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {voucher.store === 'Lidl' ? '🛒' : voucher.store === 'Kaufland' ? '🏬' : '♻️'}
                          </span>
                          <h3 className="font-semibold">{voucher.store}</h3>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold">
                          €{voucher.value}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{voucher.description}</p>
                      
                      <div className="glass-card p-2 mb-3 font-mono text-center text-sm">
                        {voucher.code}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Expires: {format(voucher.expires_at, 'MMM dd, yyyy')}</span>
                        <Badge variant="outline" className="text-xs">
                          {voucher.used ? 'Used' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Rewards */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Redeem Your XP</h2>
            <p className="text-muted-foreground">
              Convert your XP into valuable vouchers for Schwarz Group stores
            </p>
          </div>

          {schwarzStores.map((store, storeIndex) => (
            <Card key={storeIndex} className={`glass-card ${store.borderColor}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${store.bgColor} rounded-lg flex items-center justify-center text-2xl`}>
                    {store.logo}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${store.color}`}>{store.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {store.name === 'PreZero (Recycling)' 
                        ? 'Sustainable waste management services' 
                        : 'Food & grocery vouchers'
                      }
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {store.vouchers.map((voucher, voucherIndex) => (
                    <div key={voucherIndex} className="glass-card-hover p-4 border border-border/50">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-foreground mb-1">
                          €{voucher.value}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Zap className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">{voucher.cost} XP</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {voucher.description}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Affordability indicator */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Affordability</span>
                          <span className={currentXP >= voucher.cost ? "text-green-500" : "text-red-500"}>
                            {currentXP >= voucher.cost ? "✓ Can afford" : "✗ Need more XP"}
                          </span>
                        </div>
                        
                        <Progress 
                          value={Math.min((currentXP / voucher.cost) * 100, 100)} 
                          className="h-2"
                        />
                        
                        <Button 
                          className={`w-full transition-all duration-300 ${
                            currentXP >= voucher.cost 
                              ? `${store.color.replace('text-', 'bg-').replace('-600', '-500')} hover:scale-105 text-white` 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                          disabled={currentXP < voucher.cost}
                          onClick={() => redeemVoucher(store.name, voucher)}
                        >
                          {currentXP >= voucher.cost ? (
                            <>
                              <Gift className="w-4 h-4 mr-2" />
                              Redeem Now
                            </>
                          ) : (
                            <>
                              <Trophy className="w-4 h-4 mr-2" />
                              Need {voucher.cost - currentXP} more XP
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Earn More XP */}
        <Card className="glass-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              How to Earn More XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">📸</div>
                <h4 className="font-semibold mb-1">Scan Products</h4>
                <p className="text-sm text-muted-foreground mb-2">+50 XP per scan</p>
                <p className="text-xs text-muted-foreground">Track expiry dates</p>
              </div>
              
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">🧾</div>
                <h4 className="font-semibold mb-1">Upload Receipts</h4>
                <p className="text-sm text-muted-foreground mb-2">+100 XP per receipt</p>
                <p className="text-xs text-muted-foreground">Auto-categorize purchases</p>
              </div>
              
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-semibold mb-1">Use Products</h4>
                <p className="text-sm text-muted-foreground mb-2">+25 XP per item</p>
                <p className="text-xs text-muted-foreground">Reduce food waste</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;