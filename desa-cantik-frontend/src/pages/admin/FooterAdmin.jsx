import { useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FooterContext } from "@/contexts/FooterContext";

export default function FooterAdmin() {
    const { footerData, updateFooterData } = useContext(FooterContext);
    const [data, setData] = useState(footerData);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setData(footerData);
    }, [footerData]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateFooterData(data);
            setIsDialogOpen(false);
            toast.success("Kontak footer berhasil diperbarui!");
        } catch (error) {
            toast.error("Gagal menyimpan data.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Kelola Kontak Footer</h1>

                <Button
                    className="bg-[#154D71] text-white px-5 shadow-md hover:bg-[#113C57]"
                    onClick={() => setIsDialogOpen(true)}
                >
                    Edit Kontak
                </Button>
            </div>

            {/* MENAMPILKAN DATA */}
            <Card className="shadow-lg border border-slate-200">
                <CardContent className="p-6 space-y-5">
                    <h2 className="text-xl font-semibold text-slate-800">
                        Data Kontak Saat Ini
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-slate-700">

                        <div>
                            <p className="text-sm font-semibold text-slate-500">Email</p>
                            <p className="text-base">{footerData.email || "-"}</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-500">Telepon</p>
                            <p className="text-base">{footerData.phone || "-"}</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-500">BPS Toraja Utara</p>
                            <p className="text-base break-all">{footerData.bps_torut}</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-500">BPS Sulsel</p>
                            <p className="text-base break-all">{footerData.bps_sulsel}</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-500">BPS RI</p>
                            <p className="text-base break-all">{footerData.bps_ri}</p>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* POPUP FORM EDIT */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Kontak Footer</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi kontak yang tampil pada footer website.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div>
                            <Label>Email</Label>
                            <Input name="email" value={data.email} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Nomor Telepon</Label>
                            <Input name="phone" value={data.phone} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Link BPS Toraja Utara</Label>
                            <Input name="bps_torut" value={data.bps_torut} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Link BPS Sulsel</Label>
                            <Input name="bps_sulsel" value={data.bps_sulsel} onChange={handleChange} />
                        </div>

                        <div>
                            <Label>Link BPS RI</Label>
                            <Input name="bps_ri" value={data.bps_ri} onChange={handleChange} />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button className="bg-[#154D71] text-white" onClick={handleSave}>
                                Simpan
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
