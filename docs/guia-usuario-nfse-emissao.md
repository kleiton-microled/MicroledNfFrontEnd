# Guia do usuário — NFSe e emissão de nota (RPS)

Este documento descreve o uso do **Portal Microled** para quem emite NFSe pelo módulo integrado: onde entrar, como definir o **certificado digital** e o fluxo até **gerar arquivos** e **enviar a nota**.

---

## 1. O que você precisa antes de começar

- **Endereço (URL)** do portal onde a aplicação foi publicada (ex.: ambiente interno ou homologação).
- **API de NFSe** acessível a partir do seu navegador (o portal conversa com esse serviço; se ele estiver indisponível, aparecerão erros ao carregar certificados ou ao calcular/enviar).
- **Certificado digital** instalado ou acessível na máquina/servidor onde a API lista os certificados (o texto da tela de configurações fala em certificados “disponíveis na máquina” para a operação).

---

## 2. Como acessar o módulo NFSe

1. Abra o portal no navegador (URL fornecida pela sua equipe ou ambiente de testes).
2. Na **página inicial**, use o botão **“Acessar módulo NFSe”** (leva para `/nfse`).
3. O módulo abre com menu lateral. As principais entradas são:
   - **Dashboard** — `/nfse/dashboard`
   - **Consulta NFSe** — consulta de notas
   - **Emissão NFSe** — geração de arquivo RPS e envio da nota — `/nfse/emissao-nfse`
   - **Cancelamento NFSe**
   - **Configurações NFSe** — empresa, ambiente e **certificado** — `/nfse/configuracoes-nfse`

Para emitir, o caminho usual é: **Configurações NFSe** (certificado) → **Emissão NFSe** (dados e envio).

---

## 3. Selecionar o certificado digital

O certificado usado na emissão é o que a API considera **“certificado atual”** (marcado como selecionado). Isso é configurado na tela **Configurações NFSe**.

### Passos

1. No menu lateral, abra **“Configurações NFSe”**.
2. Ao entrar, o sistema pode abrir automaticamente a lista de certificados. Se não abrir, clique em **“Selecionar certificado”**.
3. Na janela (modal), aguarde o carregamento da lista. Em caso de erro, use **“Tentar novamente”**; se a lista estiver vazia, use **“Atualizar lista”**.
4. **Clique no certificado desejado** na lista (cada linha é um botão). O sistema envia a seleção para a API; enquanto processa, pode aparecer **“Selecionando…”** no item. O certificado já marcado como **“Atual”** é o que está em uso.
5. Verifique o **resumo** à direita: nome do certificado, documento (CNPJ/CPF), validade e se há chave privada disponível.
6. Ajuste, se necessário, **“Dados principais”** no formulário (empresa, **ambiente** Produção ou Homologação, CNPJ/CPF, inscrição municipal, etc.), conforme orientação do seu fiscal ou TI.

Se nenhum certificado estiver selecionado, a **Emissão NFSe** pode exibir aviso de que nenhum certificado atual foi encontrado; nesse caso, volte às configurações e selecione um certificado válido.

---

## 4. Tela “Emissão NFSe” — fluxo até a nota

A título **“Geração local de arquivo RPS”** concentra o fluxo de teste/emissão. Resumo do que a interface orienta:

- Dados do **prestador** vêm do **certificado atual**; com certificado ativo, parte desses campos fica **bloqueada**.
- **Prestador** e **tomador** podem ser ajudados pelo **cadastro local** (digite CNPJ ou razão social para ver sugestões).
- Os blocos do formulário são **seções recolhíveis**: clique no título de cada bloco para expandir ou fechar.

### 4.1. Conferir o certificado na emissão

No topo da página de emissão deve aparecer um aviso **informativo** com o nome (e documento) do **certificado atual carregado**. Se aparecer **alerta em amarelo**, leia a mensagem: em geral indica que não há certificado atual ou houve falha ao carregar — corrija nas **Configurações NFSe**.

### 4.2. Preencher o formulário

Abra cada seção necessária e preencha, entre outras:

- **Prestador (certificado)** — conferência/ajustes permitidos (e-mail, endereço, etc., conforme liberado).
- **Tomador** — identificação e endereço do tomador.
- **RPS / serviço** — série, número, datas, código de serviço, discriminação, valores, retenções, etc.

**Importar RPS pendente** (botão na parte inferior do formulário): opcional; busca um RPS pendente na API e preenche o formulário. Se não houver pendência, o sistema informa que não há RPS pendente.

### 4.3. Calcular tributos (obrigatório antes de gerar ou enviar)

1. Abra a seção **“Tributos”**.
2. Clique em **“Calcular valores e impostos”**.

Para o cálculo ser aceito na validação local, é necessário informar pelo menos:

- **Código de serviço**
- **Valor dos serviços** (valor numérico válido)
- **Alíquota dos serviços** (valor numérico válido)

Após sucesso, aparece a indicação de que o **cálculo foi concluído** e os campos de tributos vindos da API ficam preenchidos (muitos permanecem **somente leitura**).

**Importante:** se você alterar **valor dos serviços**, **alíquota** ou **código de serviço**, o sistema **invalida** o cálculo anterior: é preciso **calcular de novo** antes de **Gerar arquivos** ou **Enviar nota**.

### 4.4. Gerar arquivos RPS

- Botão **“Gerar arquivos”** (envio do formulário principal).
- Só fica habilitado quando o **cálculo de tributos foi concluído com sucesso**.
- Em caso de sucesso, a área **“Resultado da geração”** mostra mensagens, alertas ou erros e caminhos dos arquivos gerados, com opções para **abrir** arquivos locais quando o sistema fornecer o caminho (depende do ambiente e das permissões do navegador/sistema).

### 4.5. Enviar a nota (processar RPS)

- Botão **“Enviar nota”**.
- Também exige **cálculo de tributos concluído**.
- Envia o RPS para processamento na API. Em caso de erro, mensagens aparecem na própria tela.

### 4.6. Limpar o formulário

**“Limpar formulário”** redefine os dados do formulário e o estado do cálculo de impostos; o certificado em uso continua sendo o atual configurado na API.

---

## 5. Protocolo e consulta de status

Depois do envio, a API pode devolver um **protocolo**.

1. Na caixa **“Protocolo para consulta de status”**, confira ou informe o número do protocolo (ele pode ser preenchido automaticamente após um envio bem-sucedido que retorne protocolo).
2. Clique em **“Consultar status”**.
3. O sistema usa o **CNPJ do certificado atual** junto com o protocolo; se faltar protocolo ou CNPJ no certificado, uma mensagem de erro orienta o que corrigir.

---

## 6. Resumo do fluxo (ordem sugerida)

| Ordem | Onde | Ação |
|------:|------|------|
| 1 | Portal inicial | Acessar módulo NFSe |
| 2 | Configurações NFSe | Selecionar certificado e revisar ambiente/dados da empresa |
| 3 | Emissão NFSe | Conferir aviso do certificado atual |
| 4 | Emissão NFSe | Preencher seções (e opcionalmente importar RPS pendente) |
| 5 | Emissão NFSe — Tributos | **Calcular valores e impostos** |
| 6 | Emissão NFSe | **Gerar arquivos** e/ou **Enviar nota** |
| 7 | Emissão NFSe | Opcional: **Consultar status** com o protocolo |

---

## 7. Dúvidas frequentes

**Por que “Gerar arquivos” e “Enviar nota” estão desabilitados?**  
Enquanto o cálculo de tributos não for concluído com sucesso, esses botões permanecem desabilitados.

**Alterei valor ou alíquota e o botão voltou a desabilitar?**  
Sim. Recalcule os tributos.

**O certificado na emissão não é o que eu escolhi.**  
Altere de novo em **Configurações NFSe** e recarregue a página de emissão se necessário; o prestador bloqueado segue o certificado que a API considera selecionado.

---

*Documento alinhado ao comportamento da aplicação em `nfse` (rotas `/nfse/...`). Ajustes de URL base e políticas de certificado dependem do ambiente publicado pela sua organização.*
