import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "@/components/Layout/TranslationContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MiniLoader from "../MiniLoader";

const PaymentMethodDrawer = ({
  open,
  onClose,
  onSubmit,
  amount,
  isLoading = false,
  enabledPaymentMethods,
  selectedMethod,
  setSelectedMethod
}) => {
  const t = useTranslation();
 

  const handleSubmit = () => {
    if (!selectedMethod) return;
    onSubmit(selectedMethod);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-0">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("selectPaymentMethod")}</h2>
          
          <div className="space-y-4">
            {enabledPaymentMethods?.map((method) => (
              <div
                key={method?.method}
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer border transition-all ${
                  selectedMethod === method?.method
                    ? "border_color light_bg_color primary_text_color"
                    : "border-gray-200 hover:light_bg_color"
                }`}
                onClick={() => setSelectedMethod(method?.methodType)}
              >
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={method?.methodIcon?.src} alt={method?.method} />
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium capitalize">{t(method?.method)}</h3>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {selectedMethod === method?.methodType && (
                    <div className="w-3 h-3 rounded-full primary_bg_color" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>{t("finalPrice")}</span>
              <span className="primary_text_color">{amount}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedMethod || isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white dark:text-black font-medium ${
                !selectedMethod || isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "primary_bg_color hover:bg-primary/90"
              }`}
            >
              {isLoading ? <MiniLoader /> : t("proceedToPay")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodDrawer;