import { useSMARTCalculation } from "@/hooks/use-smart-calculation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Edit, Trash2 } from "lucide-react";

interface Criteria {
  id: string;
  name: string;
  weight: number;
  type: "benefit" | "cost";
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl leading-none" onClick={onClose} type="button">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

const getWeightLabel = (weight: number) => {
  switch (weight) {
    case 1:
      return "Tidak Penting";
    case 2:
      return "Kurang Penting";
    case 3:
      return "Cukup Penting";
    case 4:
      return "Penting";
    case 5:
      return "Sangat Penting";
    default:
      return "Cukup Penting";
  }
};

const getWeightColor = (weight: number) => {
  switch (weight) {
    case 1:
      return "bg-red-100 text-red-800";
    case 2:
      return "bg-orange-100 text-orange-800";
    case 3:
      return "bg-yellow-100 text-yellow-800";
    case 4:
      return "bg-blue-100 text-blue-800";
    case 5:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DataKriteriaPage() {
  const { criteria, addCriteria, updateCriteria, deleteCriteria } = useSMARTCalculation();

  const [showModal, setShowModal] = useState(false);
  const [editCriteria, setEditCriteria] = useState<Criteria | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [criteriaName, setCriteriaName] = useState("");
  const [criteriaWeight, setCriteriaWeight] = useState(3);
  const [criteriaType, setCriteriaType] = useState<"benefit" | "cost">("benefit");

  const openAdd = () => {
    setEditCriteria(null);
    setCriteriaName("");
    setCriteriaWeight(3);
    setCriteriaType("benefit");
    setShowModal(true);
    setFormError("");
  };
  const openEdit = (c: Criteria) => {
    setEditCriteria(c);
    setCriteriaName(c.name);
    setCriteriaWeight(c.weight);
    setCriteriaType(c.type);
    setShowModal(true);
    setFormError("");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      if (editCriteria) {
        await updateCriteria(editCriteria.id, { name: criteriaName, weight: criteriaWeight, type: criteriaType });
      } else {
        await addCriteria(criteriaName, criteriaWeight, criteriaType);
      }
      setShowModal(false);
    } catch (err) {
      setFormError((err as Error).message || "Gagal menyimpan kriteria");
    }
    setFormLoading(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Kriteria</h1>
            <p className="text-sm text-gray-600 mt-1">Kelola kriteria penilaian</p>
          </div>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kriteria
        </Button>
      </div>

      {/* Data Display */}
      {criteria.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kriteria</h3>
            <p className="text-gray-600 text-center mb-4">Mulai dengan menambahkan kriteria penilaian pertama</p>
            <Button onClick={openAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kriteria Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {criteria.map((c: Criteria) => (
              <Card key={c.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getWeightColor(c.weight)}`}>Bobot: {c.weight}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {c.type === "benefit" ? "Benefit" : "Cost"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tingkat Kepentingan:</span> {getWeightLabel(c.weight)}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)} className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteCriteria(c.id)} className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Kriteria</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bobot</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipe</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tingkat Kepentingan</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {criteria.map((c: Criteria) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{c.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`text-xs ${getWeightColor(c.weight)}`}>{c.weight}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-xs capitalize">
                              {c.type === "benefit" ? "Benefit" : "Cost"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{getWeightLabel(c.weight)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteCriteria(c.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="pr-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{editCriteria ? "Edit Kriteria" : "Tambah Kriteria"}</h2>
            <p className="text-sm text-gray-600">{editCriteria ? "Ubah informasi kriteria" : "Tambahkan kriteria penilaian baru"}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kriteria</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={criteriaName}
                onChange={(e) => setCriteriaName(e.target.value)}
                placeholder="Masukkan nama kriteria"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bobot (1-5)</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={criteriaWeight}
                onChange={(e) => setCriteriaWeight(Number(e.target.value))}
                required
              >
                <option value={1}>1 - Tidak Penting</option>
                <option value={2}>2 - Kurang Penting</option>
                <option value={3}>3 - Cukup Penting</option>
                <option value={4}>4 - Penting</option>
                <option value={5}>5 - Sangat Penting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kriteria</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={criteriaType}
                onChange={(e) => setCriteriaType(e.target.value as "benefit" | "cost")}
                required
              >
                <option value="benefit">Benefit (Semakin tinggi semakin baik)</option>
                <option value="cost">Cost (Semakin rendah semakin baik)</option>
              </select>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="order-2 sm:order-1">
              Batal
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700 order-1 sm:order-2 flex-1">
              {formLoading ? "Menyimpan..." : editCriteria ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
