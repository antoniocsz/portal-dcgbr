// Path: apps/web/src/features/legal/model/content.ts
// Conteúdo das páginas legais (pt-BR) — fonte única, editável.
//
// ATENÇÃO: este é um documento-MODELO, redigido para o portal e sujeito a
// revisão jurídica. O conteúdo descreve apenas o que o portal efetivamente
// faz hoje; não inventamos práticas, empresas ou finalidades.
import type { LegalDocument, LegalSlug } from './types'

export const LEGAL_CONTACT_EMAIL = 'contato@digimoncardgamebrasil.com.br'
export const LEGAL_LAST_UPDATED = '12 de outubro de 2026'
export const LEGAL_DISCLAIMER =
  'Documento-modelo redigido para este portal e sujeito a revisão jurídica. ' +
  'A DigiTCG Brasil é um projeto de fã, sem afiliação com a Bandai Namco.'

const CONTACT_LINK = {
  text: LEGAL_CONTACT_EMAIL,
  href: `mailto:${LEGAL_CONTACT_EMAIL}`,
  external: true
}

const PRIVACIDADE: LegalDocument = {
  slug: 'privacidade',
  title: 'Política de Privacidade',
  description:
    'Saiba quais dados a DigiTCG Brasil coleta, para que os usamos, com quem ' +
    'compartilhamos e como você pode exercer os seus direitos como titular (LGPD).',
  updatedAt: LEGAL_LAST_UPDATED,
  intro: [
    'Esta Política de Privacidade descreve como a DigiTCG Brasil trata os dados pessoais ' +
      'das pessoas que usam este portal, em conformidade com a Lei Geral de Proteção de ' +
      'Dados Pessoais (Lei nº 13.709/2018 — LGPD).'
  ],
  sections: [
    {
      id: 'controlador',
      heading: 'Quem é o controlador',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'A DigiTCG Brasil é um portal de comunidade sobre o Digimon Card Game, mantido ' +
              'pela própria comunidade. Para os fins da LGPD, atuamos como controladores dos ' +
              'dados pessoais tratados neste site.'
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Somos um projeto de fã e não temos qualquer vínculo, patrocínio ou afiliação ' +
              'com a Bandai Namco. Em caso de dúvidas sobre esta política ou sobre o ' +
              'tratamento dos seus dados, fale com o nosso encarregado de dados (DPO) pelo ' +
              'e-mail ',
            CONTACT_LINK,
            '.'
          ]
        }
      ]
    },
    {
      id: 'dados',
      heading: 'Quais dados coletamos',
      blocks: [
        {
          type: 'paragraph',
          content: ['Coletamos apenas os dados necessários para o funcionamento do portal:']
        },
        {
          type: 'list',
          items: [
            [
              'Dados de cadastro: ' +
                'nome e endereço de e-mail, informados por você ao criar a conta.'
            ],
            [
              'Dados de conteúdo: ' +
                'comentários, decks e torneios que você publica, além das interações ' +
                'associadas à sua conta (como curtidas e cópias de decks).'
            ],
            [
              'Dados técnicos: ' +
                'endereço IP, tipo de navegador, dispositivo e páginas acessadas, gerados ' +
                'automaticamente pelo uso do site e por registros de segurança.'
            ]
          ]
        },
        {
          type: 'note',
          content: [
            'Não coletamos dados pessoais sensíveis (art. 5º, II, da LGPD) e não ' +
              'solicitamos informações de pagamento — o portal é gratuito.'
          ]
        }
      ]
    },
    {
      id: 'finalidades',
      heading: 'Para que usamos os seus dados',
      blocks: [
        { type: 'paragraph', content: ['Tratamos os seus dados para as seguintes finalidades:'] },
        {
          type: 'list',
          items: [
            ['Criar e gerenciar a sua conta e permitir o login.'],
            ['Publicar e exibir o conteúdo que você cria (comentários, decks e torneios).'],
            [
              'Moderar o conteúdo e manter a segurança do portal, prevenindo abusos e fraudes.'
            ],
            ['Responder a solicitações e prestar suporte.'],
            ['Cumprir obrigações legais e regulatórias aplicáveis.'],
            ['Gerar métricas agregadas e anônimas de uso, para melhorar o portal.']
          ]
        }
      ]
    },
    {
      id: 'base-legal',
      heading: 'Base legal (LGPD, art. 7º)',
      blocks: [
        {
          type: 'paragraph',
          content: ['Cada tratamento é fundamentado em uma base legal prevista na LGPD:']
        },
        {
          type: 'list',
          items: [
            [
              'Consentimento (art. 7º, I): para dados e comunicações opcionais que você ' +
                'autorizar.'
            ],
            [
              'Execução de contrato (art. 7º, V): para criar a conta, autenticar o acesso e ' +
                'entregar as funcionalidades do portal.'
            ],
            [
              'Legítimo interesse (art. 7º, IX): para segurança, prevenção de abusos e ' +
                'melhoria dos serviços.'
            ],
            [
              'Cumprimento de obrigação legal (art. 7º, II): quando a lei exigir a guarda de ' +
                'determinados registros.'
            ]
          ]
        },
        {
          type: 'note',
          content: [
            'Você pode revogar o consentimento a qualquer momento, sem prejuízo dos ' +
              'tratamentos realizados anteriormente.'
          ]
        }
      ]
    },
    {
      id: 'compartilhamento',
      heading: 'Com quem compartilhamos',
      blocks: [
        {
          type: 'paragraph',
          content: ['Não vendemos, alugamos nem comercializamos os seus dados pessoais.']
        },
        {
          type: 'paragraph',
          content: [
            'O compartilhamento ocorre apenas com operadores que prestam serviços essenciais ' +
              'ao funcionamento do portal, sempre limitados ao necessário:'
          ]
        },
        {
          type: 'list',
          items: [
            [
              'Provedores de infraestrutura e hospedagem (servidores, banco de dados e ' +
                'armazenamento em nuvem).'
            ],
            ['Provedores de segurança e proteção contra abusos.'],
            ['Autoridades públicas, quando houver determinação legal ou judicial.']
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Esses operadores tratam os dados apenas conforme as nossas instruções e estão ' +
              'sujeitos a obrigações de confidencialidade.'
          ]
        }
      ]
    },
    {
      id: 'retencao',
      heading: 'Por quanto tempo guardamos',
      blocks: [
        {
          type: 'paragraph',
          content: ['Mantemos os seus dados apenas pelo tempo necessário às finalidades acima.']
        },
        {
          type: 'list',
          items: [
            [
              'Dados da conta: enquanto a conta estiver ativa. Após a exclusão, são ' +
                'eliminados ou anonimizados.'
            ],
            ['Conteúdo publicado: conforme descrito nos Termos de Uso.'],
            [
              'Registros técnicos e de segurança: pelo prazo necessário à segurança e a ' +
                'eventuais obrigações legais.'
            ]
          ]
        }
      ]
    },
    {
      id: 'direitos',
      heading: 'Seus direitos (LGPD, art. 18)',
      blocks: [
        {
          type: 'paragraph',
          content: ['Como titular de dados, você pode exercer os seguintes direitos:']
        },
        {
          type: 'list',
          items: [
            ['Confirmação da existência de tratamento.'],
            ['Acesso aos dados.'],
            ['Correção de dados incompletos, inexatos ou desatualizados.'],
            [
              'Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou ' +
                'tratados em desconformidade.'
            ],
            ['Portabilidade dos dados a outro fornecedor, mediante requisição expressa.'],
            ['Eliminação dos dados pessoais tratados com base no consentimento.'],
            ['Informação sobre as entidades com as quais compartilhamos dados.'],
            ['Revogação do consentimento, a qualquer momento.']
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Para exercer esses direitos, acesse ',
            { text: 'Meus dados', href: '/perfil' },
            ' no seu perfil ou envie um e-mail ao nosso encarregado pelo endereço ',
            CONTACT_LINK,
            '. Responderemos à sua solicitação nos prazos previstos na LGPD.'
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Você também pode abrir uma solicitação pelo nosso canal dedicado: ',
            { text: 'Como exercer seus direitos', href: '/privacidade/solicitacao' },
            ' — o pedido entra na fila de atendimento do encarregado de dados.'
          ]
        }
      ]
    },
    {
      id: 'seguranca',
      heading: 'Segurança',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Adotamos medidas técnicas e administrativas para proteger os seus dados, como ' +
              'autenticação por tokens, senhas criptografadas e acesso restrito às ' +
              'informações.'
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Nenhum sistema é totalmente imune a incidentes. Se ocorrer um incidente de ' +
              'segurança relevante, comunicaremos os titulares e a Autoridade Nacional de ' +
              'Proteção de Dados (ANPD), conforme a LGPD.'
          ]
        }
      ]
    },
    {
      id: 'atualizacoes',
      heading: 'Atualizações e contato',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Podemos atualizar esta política para refletir mudanças no portal ou na ' +
              'legislação. A data de última atualização será sempre revisada.'
          ]
        },
        {
          type: 'paragraph',
          content: ['Dúvidas sobre o tratamento dos seus dados? Fale conosco pelo e-mail ', CONTACT_LINK, '.']
        }
      ]
    }
  ]
}

const TERMOS: LegalDocument = {
  slug: 'termos',
  title: 'Termos de Uso',
  description:
    'Regras de uso do portal DigiTCG Brasil: cadastro, conduta, conteúdo do usuário, ' +
    'propriedade intelectual, responsabilidade e lei aplicável.',
  updatedAt: LEGAL_LAST_UPDATED,
  intro: [
    'Estes Termos de Uso regulam o acesso e o uso do portal DigiTCG Brasil. Leia com ' +
      'atenção: ao usar o site, você concorda com as condições abaixo.'
  ],
  sections: [
    {
      id: 'aceitacao',
      heading: 'Aceitação',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Ao acessar, navegar ou usar o portal DigiTCG Brasil, você declara que leu, ' +
              'entendeu e aceita estes Termos de Uso e a Política de Privacidade.'
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Se você não concorda com alguma condição, não utilize o portal. Leia também a ',
            { text: 'Política de Privacidade', href: '/privacidade' },
            '.'
          ]
        }
      ]
    },
    {
      id: 'cadastro',
      heading: 'Cadastro e conta',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Algumas funcionalidades exigem a criação de uma conta gratuita. Ao se cadastrar, ' +
              'você se compromete a:'
          ]
        },
        {
          type: 'list',
          items: [
            ['Informar dados verdadeiros, exatos e atualizados.'],
            ['Manter a confidencialidade da sua senha e não compartilhá-la.'],
            ['Ser responsável pelas atividades realizadas na sua conta.'],
            [
              'Ter 18 anos ou mais — ou contar com autorização do responsável legal, quando ' +
                'menor de idade.'
            ]
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Avise-nos imediatamente em caso de uso não autorizado da sua conta. A digitação ' +
              'ou o uso de dados falsos pode levar à suspensão do acesso.'
          ]
        }
      ]
    },
    {
      id: 'conduta',
      heading: 'Conduta e conteúdo do usuário',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Você é o único responsável pelo conteúdo que publica (comentários, decks e ' +
              'torneios). É proibido publicar conteúdo:'
          ]
        },
        {
          type: 'list',
          items: [
            ['Ilegal, ofensivo, difamatório ou que viole direitos de terceiros.'],
            ['Com discurso de ódio, ameaça ou incitação à violência.'],
            ['De natureza sexual explícita ou que explore menores.'],
            ['Que constitua spam, fraude, phishing ou propaganda não autorizada.'],
            ['Que infrinja direitos autorais, marcas ou a propriedade intelectual de outros.']
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Reservamo-nos o direito de moderar, editar ou remover conteúdos e de suspender ' +
              'contas que violem estes Termos.'
          ]
        },
        {
          type: 'note',
          content: [
            'Ao publicar conteúdo, você concede à DigiTCG Brasil uma licença não exclusiva e ' +
              'gratuita para exibir, distribuir e adaptar esse conteúdo no âmbito do portal. ' +
              'A autoria permanece sua.'
          ]
        }
      ]
    },
    {
      id: 'propriedade',
      heading: 'Propriedade intelectual',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Digimon, Digimon Card Game e todas as marcas, personagens e artes relacionadas ' +
              'pertencem aos seus respectivos titulares, incluindo a Bandai Namco.'
          ]
        },
        {
          type: 'note',
          content: [
            'A DigiTCG Brasil é um projeto de fã, sem qualquer afiliação, patrocínio ou ' +
              'endosso da Bandai Namco. Não representamos os titulares da marca.'
          ]
        },
        {
          type: 'paragraph',
          content: [
            'A marca, o nome e a identidade visual da DigiTCG Brasil não podem ser usados sem ' +
              'autorização.'
          ]
        }
      ]
    },
    {
      id: 'responsabilidade',
      heading: 'Isenções e limitação de responsabilidade',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'O portal é oferecido no estado em que se encontra. Empregamos esforços para ' +
              'manter as informações corretas e o serviço disponível, mas não garantimos ' +
              'operação ininterrupta nem ausência de erros.'
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Não nos responsabilizamos por danos decorrentes do uso ou da impossibilidade de ' +
              'uso do portal, nem por conteúdos de terceiros ou por links externos.'
          ]
        }
      ]
    },
    {
      id: 'suspensao',
      heading: 'Suspensão e encerramento',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Podemos suspender ou encerrar o acesso quando houver violação destes Termos, uso ' +
              'abusivo, risco à segurança ou exigência legal.'
          ]
        },
        {
          type: 'paragraph',
          content: [
            'Você pode encerrar a sua conta a qualquer momento, conforme descrito na ',
            { text: 'Política de Privacidade', href: '/privacidade' },
            '.'
          ]
        }
      ]
    },
    {
      id: 'alteracoes',
      heading: 'Alterações',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Podemos alterar estes Termos a qualquer momento. Mudanças relevantes serão ' +
              'informadas no portal e a data de última atualização será ajustada. O uso ' +
              'contínuo após as alterações significa concordância com a nova versão.'
          ]
        }
      ]
    },
    {
      id: 'lei-aplicavel',
      heading: 'Lei aplicável',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Estes Termos são regidos pelas leis brasileiras. Eventuais controvérsias serão ' +
              'resolvidas no foro do domicílio do usuário consumidor, quando aplicável.'
          ]
        },
        {
          type: 'paragraph',
          content: ['Em caso de dúvidas, fale conosco pelo e-mail ', CONTACT_LINK, '.']
        }
      ]
    }
  ]
}

const COOKIES: LegalDocument = {
  slug: 'cookies',
  title: 'Política de Cookies',
  description:
    'Entenda quais cookies o DigiTCG Brasil usa, por que eles são necessários e como ' +
    'gerenciá-los no seu navegador.',
  updatedAt: LEGAL_LAST_UPDATED,
  intro: [
    'Esta Política de Cookies explica o que são cookies, quais usamos no portal DigiTCG ' +
      'Brasil e como você pode gerenciá-los.'
  ],
  sections: [
    {
      id: 'o-que-sao',
      heading: 'O que são cookies',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Cookies são pequenos arquivos guardados no seu navegador. Eles são usados para ' +
              'lembrar preferências, manter a sua sessão e medir o uso do site.'
          ]
        }
      ]
    },
    {
      id: 'essenciais',
      heading: 'Cookies essenciais',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Usamos cookies estritamente necessários para o funcionamento do portal. Sem ' +
              'eles, o site não funciona corretamente:'
          ]
        },
        {
          type: 'list',
          items: [
            [
              'access_token — cookie de autenticação, httpOnly, usado para manter a sua ' +
                'sessão enquanto você está logado.'
            ],
            [
              'refresh_token — cookie de autenticação, httpOnly, usado para renovar a sessão ' +
                'sem exigir um novo login.'
            ]
          ]
        },
        {
          type: 'note',
          content: [
            'Por serem essenciais, esses cookies não dependem de consentimento e são gravados ' +
              'no momento do login.'
          ]
        }
      ]
    },
    {
      id: 'preferencias',
      heading: 'Preferências de consentimento',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Guardamos no próprio navegador a sua escolha sobre o banner de consentimento, ' +
              'para não exibi-lo novamente e para respeitar a sua decisão.'
          ]
        }
      ]
    },
    {
      id: 'terceiros',
      heading: 'Cookies de terceiros',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Atualmente não utilizamos cookies de terceiros para publicidade ou rastreamento. ' +
              'Caso isso mude, esta política será atualizada e pediremos o seu consentimento ' +
              'quando necessário.'
          ]
        }
      ]
    },
    {
      id: 'gerenciar',
      heading: 'Como gerenciar cookies',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Você pode bloquear ou excluir cookies nas configurações do seu navegador. ' +
              'Lembre-se de que desativar os cookies essenciais impede o login e o uso de ' +
              'áreas que exigem conta.'
          ]
        }
      ]
    },
    {
      id: 'banner',
      heading: 'Banner de consentimento',
      blocks: [
        {
          type: 'paragraph',
          content: [
            'Para revisar a sua escolha, use o banner de consentimento exibido no site ou ' +
              'consulte a ',
            { text: 'Política de Privacidade', href: '/privacidade' },
            ' para saber mais sobre o tratamento de dados.'
          ]
        }
      ]
    }
  ]
}

export const LEGAL_DOCUMENTS: Record<LegalSlug, LegalDocument> = {
  privacidade: PRIVACIDADE,
  termos: TERMOS,
  cookies: COOKIES
}

export function getLegalDocument(slug: LegalSlug): LegalDocument {
  return LEGAL_DOCUMENTS[slug]
}
