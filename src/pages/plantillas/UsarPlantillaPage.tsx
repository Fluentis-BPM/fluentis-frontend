import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '@/store';
import { fetchPlantilla, instanciarSolicitudThunk } from '@/store/templates/templatesSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ChevronLeft } from 'lucide-react';
import { CampoDinamico } from '@/components/bpm/requests/CampoDinamico';
import { fetchInputsCatalog } from '@/services/inputs';
import type { ApiInputCatalogItem } from '@/types/bpm/templates';
import type { Input as InputType } from '@/types/bpm/inputs';
import { normalizeTipoInput as normTipo } from '@/types/bpm/inputs';

export default function UsarPlantillaPage() {
  const { id } = useParams();
  const plantillaId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentUserId = useSelector((s: RootState) => s.auth.user?.idUsuario) || 0;
  const { items, loading } = useSelector((s: RootState) => s.templates);
  const plantilla = useMemo(() => items.find(p => p.idPlantilla === plantillaId), [items, plantillaId]);

  const [submitting, setSubmitting] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valores, setValores] = useState<Record<number, string>>({});

  // Siempre trae la plantilla por ID para asegurar que incluya inputs completos
  useEffect(() => {
    if (!Number.isFinite(plantillaId)) return;
    dispatch(fetchPlantilla({ id: plantillaId }));
  }, [dispatch, plantillaId]);

  // Cargar catálogo de inputs para conocer el tipo de cada inputId
  const [catalog, setCatalog] = useState<ApiInputCatalogItem[] | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCatalog(true);
        const data = await fetchInputsCatalog();
        if (mounted) setCatalog(data);
      } catch (e) {
        // silencioso: se hará fallback a textocorto
      } finally {
        if (mounted) setLoadingCatalog(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (plantilla) {
      setNombre(plantilla.nombre || '');
      setDescripcion(plantilla.descripcion || '');
      const init: Record<number, string> = {};
      (plantilla.inputs || []).forEach(i => { init[i.inputId] = i.valorPorDefecto ?? ''; });
      setValores(init);
    }
  }, [plantilla]);

  const onChangeValor = (inputId: number, value: string) => setValores((v) => ({ ...v, [inputId]: value }));

  const requiredMissing = useMemo(() => {
    if (!plantilla) return [] as number[];
    const missing: number[] = [];
    for (const i of plantilla.inputs || []) {
      if (i.requerido && !String(valores[i.inputId] ?? '').trim()) missing.push(i.inputId);
    }
    return missing;
  }, [plantilla, valores]);

  const submit = async () => {
    if (!plantilla) return;
    if (requiredMissing.length > 0) {
      toast({ title: 'Faltan campos requeridos', description: `Completa ${requiredMissing.length} campo(s) requerido(s).` });
      return;
    }
    setSubmitting(true);
    try {
      const res = await dispatch(
        instanciarSolicitudThunk({
          PlantillaId: plantilla.idPlantilla,
          SolicitanteId: currentUserId > 0 ? currentUserId : 0,
          Nombre: nombre?.trim() || plantilla.nombre,
          Descripcion: descripcion ?? '',
          OverridesValores: valores,
        })
      ).unwrap();
      let id: number | undefined;
      if (res && typeof res === 'object') {
        type Resp = { idSolicitud?: number; IdSolicitud?: number; solicitudId?: number; SolicitudId?: number };
        const r = res as Resp;
        id = r.idSolicitud ?? r.IdSolicitud ?? r.solicitudId ?? r.SolicitudId;
      }
      toast({ title: 'Solicitud creada', description: id ? `ID #${id}` : 'Se creó la solicitud' });
      navigate('/flujos/solicitudes');
    } catch (e) {
      const msg = typeof e === 'string' ? e : (e as Error)?.message;
      toast({ title: 'Error', description: msg || 'No se pudo crear la solicitud' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Regresar
        </Button>
        <div />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completar solicitud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && !plantilla ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !plantilla ? (
            <p className="text-sm text-muted-foreground">No se encontró la plantilla.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la solicitud</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={plantilla.nombre} />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción opcional" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Campos de la plantilla</h3>
                {(plantilla.inputs || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Esta plantilla no tiene campos configurados.</p>
                )}

                {loadingCatalog && (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-5/6" />
                  </div>
                )}

                {(plantilla.inputs || []).map((i) => {
                  const meta = catalog?.find(c => c.idInput === i.inputId);
                  const tipo = normTipo(meta?.tipoInput || 'textocorto');
                  const inputObj: InputType = {
                    id_input: i.inputId,
                    tipo_input: tipo,
                    etiqueta: i.nombre || `Campo #${i.inputId}`,
                    placeholder: i.placeHolder || undefined,
                  };
                  return (
                    <div key={i.inputId} className="space-y-2">
                      <CampoDinamico
                        input={inputObj}
                        valor={valores[i.inputId] ?? ''}
                        requerido={Boolean(i.requerido)}
                        onChange={(v) => onChangeValor(i.inputId, v)}
                        showRequiredToggle={false}
                      />
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Input #{i.inputId}</Badge>
                        {i.valorPorDefecto && <Badge variant="secondary">Defecto: {String(i.valorPorDefecto)}</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button onClick={submit} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear solicitud
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
