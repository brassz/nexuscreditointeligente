import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectToHome } from "@/lib/utils";

export default function Admin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060810] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Painel Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-secondary">
            Área administrativa. Utilize o painel comercial para gestão de leads.
          </p>
          <Link to="/painel">
            <Button variant="cta" className="w-full">
              Ir para o Painel
            </Button>
          </Link>
          <Button variant="glass" className="w-full" onClick={redirectToHome}>
            Voltar ao site
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
