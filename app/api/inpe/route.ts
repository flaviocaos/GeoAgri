import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const urls = [
      {
        url: 'https://terrabrasilis.dpi.inpe.br/geoserver/deter-amz/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=deter-amz:deter_amz&maxFeatures=100&outputFormat=application/json&sortBy=view_date+D',
        bioma: 'Amazonia'
      },
      {
        url: 'https://terrabrasilis.dpi.inpe.br/geoserver/deter-cerrado/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=deter-cerrado:deter_cerrado&maxFeatures=100&outputFormat=application/json&sortBy=view_date+D',
        bioma: 'Cerrado'
      },
    ]

    const alertas: any[] = []

    for (const { url, bioma } of urls) {
      try {
        const res = await fetch(url, { next: { revalidate: 300 } })
        const contentType = res.headers.get('content-type') || ''

        if (contentType.includes('json')) {
          const data = await res.json()
          const features = (data.features || []).map((f: any, idx: number) => {
            const props = f.properties || {}
            // Campo correto confirmado: areamunkm
            const areaKm = props.areamunkm || props.areakm || props.area_km || props.areauckm || 0
            const areaha = parseFloat(areaKm) * 100

            const coords = getLatLng(f.geometry)

            return {
              id: f.id || `DETER-${bioma[0]}-${idx}`,
              tipo: (props.classname || 'DESMATAMENTO').toUpperCase().replace(/ /g, '_'),
              bioma,
              estado: props.uf || '—',
              municipio: props.municipality || props.municipali || '—',
              area: +areaha.toFixed(1),
              data: props.view_date || '—',
              sensor: props.sensor || '—',
              satelite: props.satellite || '—',
              lat: coords[1],
              lng: coords[0],
            }
          })
          alertas.push(...features)
        }
      } catch (e) {
        console.error(`Erro ${bioma}:`, e)
      }
    }

    if (alertas.length === 0) {
      return NextResponse.json(
        { erro: 'API do INPE nao retornou dados. Tente novamente.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      alertas,
      total: alertas.length,
      fonte: 'DETER/INPE via TerraBrasilis'
    })

  } catch (e: any) {
    return NextResponse.json({ erro: e.message || 'Erro interno.' }, { status: 500 })
  }
}

function getLatLng(geometry: any): [number, number] {
  if (!geometry?.coordinates) return [0, 0]
  const coords = geometry.coordinates
  if (geometry.type === 'Point') return coords
  if (geometry.type === 'Polygon') return coords[0][0]
  if (geometry.type === 'MultiPolygon') return coords[0][0][0]
  return [0, 0]
}